<?php 

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Services\MessagingService;

class MessagingController extends Controller
{
    /**
     * Send a test message to the specified email address.
     */
    protected $messaging;

    public function __construct(MessagingService $messaging)
    {
        $this->messaging = $messaging;
    }

    public function sendTestMessage(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
        ]);

        // Delegate sending to the MessagingService
        try {
            $this->messaging->sendEmail($data['email'], $data['subject'], $data['body']);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to send message.',
                'error' => $e->getMessage(),
            ], 500);
        }

        return response()->json([
            'message' => 'Test message sent successfully.',
            'data' => $data,
        ]);
    }
}