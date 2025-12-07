<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;

class MessagingService
{
    /**
     * Send a plain-text email.
     *
     * @param string $to
     * @param string $subject
     * @param string $body
     * @return bool
     */
    public function sendEmail(string $to, string $subject, string $body): bool
    {
        Mail::raw($body, function ($message) use ($to, $subject) {
            $message->to($to)
                    ->subject($subject);
        });

        return true;
    }
}
