import axios from "axios";


export const initializePaymentServices = async (
  email: string,
  amount: number,
  booking_id: number
) => {
  try {
    const payload = {
  email,
  amount: amount * 100,
  metadata: { booking_id },
  callback_url: `${process.env.FRONTEND_URL}/payment/callback`
    };

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data; // contains authorization_url + reference

  } catch (error: any) {
    console.error("Paystack init error:", error?.response?.data || error);
    return null;
  }
};
