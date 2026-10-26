---
title: "Razorpay webhook signature verification in Go"
seoTitle: "Razorpay Webhook Signature Verification in Go (Golang)"
description: "Verify a Razorpay webhook in Go with crypto/hmac: the raw body, X-Razorpay-Signature, duplicate events by X-Razorpay-Event-Id, the 5-second limit, and a tested handler."
author: itswadesh
tags: ["Razorpay", "Go", "golang", "webhooks", "HMAC", "payments", "GoCommerce"]
---

To verify a Razorpay webhook in Go, compute the HMAC-SHA256 of the raw request body, keyed with your webhook secret, and compare it with the hex value in the `X-Razorpay-Signature` header using `hmac.Equal`. That check needs only the standard library. A handler you can trust also has to deal with duplicates, retries and payloads that do not decode the way you expect.

This post gives a complete handler with a test, then the mistakes to avoid. Every rule about Razorpay comes from its documentation, linked where it is used. At the end it shows how the Razorpay module in [GoCommerce](/gocommerce/) does the same job, and where it differs.

## What does Razorpay sign?

The body. Razorpay’s [validation guide](https://razorpay.com/docs/webhooks/validate-test/) says it signs each payload with the webhook secret you set in the Dashboard, using HMAC with SHA256, and sends the result in `X-Razorpay-Signature`. It also says to pass the raw request body to the check, and not to parse or cast it first.

The raw body matters because JSON has many byte-level spellings of the same object. If you decode the body into a struct and encode it again, the key order, the spacing and the number format can all change. Then your HMAC is of different bytes and the signature fails, or, worse, you change the code until it passes for the wrong reason.

## A complete handler

```go
package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
)

// validSignature reports whether header is the hex HMAC-SHA256 of body,
// keyed with the webhook secret.
func validSignature(body []byte, header, secret string) bool {
	got, err := hex.DecodeString(strings.TrimSpace(header))
	if err != nil || len(got) == 0 {
		return false
	}
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(body)
	return hmac.Equal(got, mac.Sum(nil))
}

type event struct {
	Event   string `json:"event"`
	Payload struct {
		Payment struct {
			Entity struct {
				ID       string `json:"id"`
				OrderID  string `json:"order_id"`
				Amount   int64  `json:"amount"`
				Currency string `json:"currency"`
				Status   string `json:"status"`
			} `json:"entity"`
		} `json:"payment"`
	} `json:"payload"`
}

// seen stands in for a table with a unique key on the event id.
var seen sync.Map

func webhook(secret string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
		if err != nil {
			http.Error(w, "could not read body", http.StatusBadRequest)
			return
		}
		if !validSignature(body, r.Header.Get("X-Razorpay-Signature"), secret) {
			http.Error(w, "invalid signature", http.StatusBadRequest)
			return
		}
		var e event
		if err := json.Unmarshal(body, &e); err != nil {
			http.Error(w, "malformed event", http.StatusBadRequest)
			return
		}
		if id := r.Header.Get("X-Razorpay-Event-Id"); id != "" {
			if _, dup := seen.LoadOrStore(id, true); dup {
				w.WriteHeader(http.StatusOK)
				return
			}
		}
		p := e.Payload.Payment.Entity
		switch e.Event {
		case "payment.captured":
			log.Printf("captured %s on %s: %d %s", p.ID, p.OrderID, p.Amount, p.Currency)
		case "payment.failed":
			log.Printf("failed %s on %s", p.ID, p.OrderID)
		}
		w.WriteHeader(http.StatusOK)
	}
}

func main() {
	http.HandleFunc("POST /webhooks/razorpay", webhook(os.Getenv("RAZORPAY_WEBHOOK_SECRET")))
	log.Fatal(http.ListenAndServe(":8080", nil))
}
```

The method in the route pattern, `"POST /webhooks/razorpay"`, needs Go 1.22 or later. The struct decodes only the fields this handler reads. The payload shape is from Razorpay’s [payment webhook payloads](https://razorpay.com/docs/webhooks/payloads/payments/): `event` names what happened, and `payload.payment.entity` is the payment, with its `id`, `amount` in the currency’s smallest unit, `currency`, `status` and `order_id`.

## How do you test it without Razorpay?

Sign a sample body yourself and send it through `httptest`. This test uses the `payment.captured` sample from Razorpay’s documentation, cut down to the fields above:

```go
package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

const body = `{"entity":"event","account_id":"acc_BFQ7uQEaa7j2z7","event":"payment.captured","contains":["payment"],"payload":{"payment":{"entity":{"id":"pay_DESlfW9H8K9uqM","amount":100,"currency":"INR","status":"captured","order_id":"order_DESlLckIVRkHWj","notes":[]}}},"created_at":1567674606}`

func sign(b, secret string) string {
	m := hmac.New(sha256.New, []byte(secret))
	m.Write([]byte(b))
	return hex.EncodeToString(m.Sum(nil))
}

func post(h http.Handler, sig, id string) int {
	req := httptest.NewRequest("POST", "/webhooks/razorpay", strings.NewReader(body))
	req.Header.Set("X-Razorpay-Signature", sig)
	req.Header.Set("X-Razorpay-Event-Id", id)
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	return rec.Code
}

func TestWebhook(t *testing.T) {
	h := webhook("s3cret")
	if got := post(h, sign(body, "s3cret"), "evt_1"); got != 200 {
		t.Fatalf("signed event: got %d, want 200", got)
	}
	if got := post(h, sign(body, "other"), "evt_2"); got != 400 {
		t.Fatalf("wrong secret: got %d, want 400", got)
	}
	if got := post(h, "", "evt_3"); got != 400 {
		t.Fatalf("no signature: got %d, want 400", got)
	}
	if got := post(h, sign(body, "s3cret"), "evt_1"); got != 200 {
		t.Fatalf("duplicate: got %d, want 200", got)
	}
	if !validSignature([]byte(body), sign(body, "s3cret"), "s3cret") || validSignature([]byte(body+" "), sign(body, "s3cret"), "s3cret") {
		t.Fatal("a changed byte must fail the signature")
	}
}
```

Put both files in one directory with a `go.mod` and run `go test`. The last assertion matters most. One extra space after the body fails the signature.

## What goes wrong in practice?

**Comparing with `==`.** Use `hmac.Equal`, which takes the same time however many leading bytes match. A string comparison returns early, and the timing difference leaks how much of a forged signature was right. Decode the header from hex first and compare bytes.

**Reading the body twice.** If a middleware or a logger reads `r.Body` before your handler, the handler sees an empty body and every signature fails. Read it once, keep the bytes, and limit the size. `io.LimitReader` stops a huge request from filling memory.

**Treating every delivery as new.** Razorpay delivers at least once. Its [webhook best practices](https://razorpay.com/docs/webhooks/best-practices/) say the same event can arrive more than once, and point to the `x-razorpay-event-id` header, unique per event, for spotting duplicates. In production, replace the `sync.Map` above with an insert into a table that has a unique key on the event id. Run the insert and the state change in one transaction, or delete the claim when processing fails, so that Razorpay’s retry can succeed.

**Answering slowly.** The same page says a response that takes more than 5 seconds is a timeout, and any status outside 2xx is a failure. Razorpay retries with exponential backoff for 24 hours after the event was created. If deliveries keep failing for 24 hours, it disables the webhook until you switch it back on in the Dashboard. So acknowledge quickly, and move slow work such as emails to a queue.

**Assuming events arrive in order.** The [validation guide](https://razorpay.com/docs/webhooks/validate-test/) warns that the order of events is not guaranteed. Make each transition check the current state of the order, so that a late `payment.failed` from an earlier attempt cannot undo a capture that came first.

**Decoding `notes` into a map.** Razorpay’s own sample sends `"notes": []` when a payment has no notes, an empty JSON array rather than an object. A `map[string]string` field fails on that with `json: cannot unmarshal array into Go struct field`, and the whole `Unmarshal` returns an error. If you need notes, decode them into `json.RawMessage` and handle both shapes. The handler above avoids the problem by reading `order_id`, which every payment made against an order carries.

**Rotating the secret.** When you change the webhook secret, retries of older events are still signed with the old one. The validation guide says to keep using the old secret for those. During a rotation, accept either secret for a while.

## What about the signature Checkout returns to the browser?

That is a second, separate check. After a successful payment, Razorpay Checkout gives the browser `razorpay_order_id`, `razorpay_payment_id` and `razorpay_signature`. The [integration guide](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/build-integration/) says the signature is the HMAC-SHA256 of the order id, a `|`, and the payment id, keyed with your API key secret, not the webhook secret. It also says to use the order id from your own server, not the one the browser sends back.

```go
// validPaymentSignature checks the razorpay_signature that Checkout hands the
// browser: the hex HMAC-SHA256 of "<order id>|<payment id>", keyed with the
// API key secret. orderID is the one your server created, not the one the
// browser sent back.
func validPaymentSignature(orderID, paymentID, signature, keySecret string) bool {
	return validSignature([]byte(orderID+"|"+paymentID), signature, keySecret)
}
```

The same guide recommends webhooks as well, for confirmation on the server.

## How does GoCommerce’s Razorpay module do it?

The [Razorpay module](/integrations/payments-razorpay/) in GoCommerce, `ext/payments-razorpay/razorpay.go`, follows the same scheme, with a few differences worth knowing:

- **The signature check matches the one above**: the hex HMAC-SHA256 of the raw body, compared with `hmac.Equal`, with the body capped at 1 MiB. It uses only `crypto/hmac` and `net/http`, no SDK.
- **Its duplicate key is the event name plus the payment id**, such as `payment.captured:pay_…`, not the `x-razorpay-event-id` header. A code comment says Razorpay has no per-delivery event id. Razorpay’s best-practices page does document that header. The module’s key still stops a payment being recorded twice, because the same capture is the same fact however often it is reported. It differs from Razorpay’s guidance all the same.
- **It finds the store order from the payment’s `notes`.** When it creates the Razorpay order it writes the store’s `order_id` into the notes, and the webhook reads `notes.order_id` back.
- **It does not verify the Checkout signature.** The browser’s callback is not what marks an order paid. The webhook does, through `payment.captured`, and the module can also ask Razorpay’s API for the payment and check that it is captured for the order’s exact total and currency.
- **Claims are released on failure**, so a delivery that fails half-way is retried rather than lost.

Payment state then goes through the engine’s one `MarkPaid`, which ignores a replay on an order that is already paid and refuses to revive a cancelled or refunded one. [Building an ecommerce backend in Go](/blog/ecommerce-backend-in-go/) explains why every source of “paid” ends there.

To use it, see the [Razorpay module page](/integrations/payments-razorpay/) and the full [list of GoCommerce modules](/integrations/). For a storefront that opens Razorpay’s checkout modal against GoCommerce, [Svelte Commerce](/svelte-commerce/) supports it through its GoCommerce connector.
