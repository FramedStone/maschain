export const handle_get_token_balance = async () => {
    try {
        const status_transfer = await fetch(
            `${process.env.REACT_APP_PUBLIC_API_URL}/api/token/balance`,
            {
              method: "POST",
              headers: {
                client_id: process.env.REACT_APP_PUBLIC_CLIENT_ID,
                client_secret: process.env.REACT_APP_PUBLIC_CLIENT_SECRET,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                wallet_address: sessionStorage.getItem("wallet_address_user"),
                contract_address: process.env.REACT_APP_CONTRACT_ADDRESS
              }),
            }
        );
        const result_balance = await status_transfer.json();
        console.log(result_balance);
        return(result_balance.result);
    } catch (error) {
        alert("Error getting balance");
        console.log("Error getting account token balance: ", error);
    }
}