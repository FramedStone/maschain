/*
Name	            Type    Required
wallet_address	    string	Yes
to	                string	Yes
amount	            string	Yes
contract_address	string	Yes
callback_url	    string	Yes
*/

export const handle_mint_token = async() => {
    try {
        const status_mint = await fetch(
            `${process.env.REACT_APP_PUBLIC_API_URL}/api/token/mint`,
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
        const result_mint = await status_mint.json();
        console.log(result_mint);

    } catch (error) {
        console.error("Error Minting Tokens: ", error);
    }
}