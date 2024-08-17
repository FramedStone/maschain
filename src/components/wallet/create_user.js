/*  
  Name	                Type	Required
  name	                string	Yes
  email	                string	Yes
  ic	                  string	Yes
  wallet_name	          string	No
  phone	                string	No
  entity_id	            int	    No
  entity_category_id	  int	    No
*/
  
export const handle_create_wallet_voter = async () => {
  try {
    const status = await fetch(
      `${process.env.REACT_APP_PUBLIC_API_URL}/api/wallet/create-user`,
      {
        method: "POST",
        headers: {
          client_id: process.env.REACT_APP_PUBLIC_CLIENT_ID,
          client_secret: process.env.REACT_APP_PUBLIC_CLIENT_SECRET,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "name": sessionStorage.getItem("wallet_name_user"),
          "email": localStorage.getItem("wallet_email_user"),
          "ic": sessionStorage.getItem("wallet_ic_user")
        }), 
      }
    );

    const result = await status.json();
    console.log(result);
    const wallet_address = result.result.wallet.wallet_address;

    localStorage.setItem("wallet_address_voter", wallet_address);

  } catch (error) {
    console.error("Error creating user wallet: ", error);
  }
}