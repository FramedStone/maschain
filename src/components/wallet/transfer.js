export const handle_transfer_token = async() => {
    try {
        const status_transfer = await fetch(
            `${process.env.REACT_APP_PUBLIC_API_URL}/api/token/token-transfer`,
            {
              method: "POST",
              headers: {
                client_id: process.env.REACT_APP_PUBLIC_CLIENT_ID,
                client_secret: process.env.REACT_APP_PUBLIC_CLIENT_SECRET,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                "wallet_address": sessionStorage.getItem("token_wallet_address"),
                "to": sessionStorage.getItem("token_wallet_address_to"),
                "amount": sessionStorage.getItem("token_amount"),
                "contract_address": process.env.REACT_APP_CONTRACT_ADDRESS,
                "callback_url": "https://postman-echo.com/post?"
              }), 
            }
        );
        const result_transfer = await status_transfer.json();
        console.log(result_transfer);
        return(result_transfer.status.status);

    } catch (error) {
        console.error("Error Minting Tokens: ", error);
    }
}