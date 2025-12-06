<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
	/**
	 * Return the authenticated user's profile.
	 */
	public function index(Request $request)
	{
		$user = $request->user();
		if (!$user) {
			return response()->json(['message' => 'Unauthenticated'], 401);
		}

		return response()->json($user);
	}

	/**
	 * Update the authenticated user's profile.
	 * Only allows changing the `name` field; `phone_number` cannot be changed via this endpoint.
	 */
	public function update(ProfileUpdateRequest $request)
	{
		$user = $request->user();
		if (!$user) {
			return response()->json(['message' => 'Unauthenticated'], 401);
		}

		// Only accept `name` from the validated request payload. Ignore phone_number even if provided.
		$data = $request->only('name');

		$user->fill($data);
		$user->save();

		// Refresh model from database to ensure latest persisted values (timestamps, casts)
		$user->refresh();

		return response()->json($user);
	}
}
