import { NextApiRequest, NextApiResponse } from "next";
import { parse } from "path";

const API_ROOT = 'https://www.nemlig.com/webapi'

type NemligProduct = {
    Id: string,
    Name: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const productList: Array<NemligProduct> = [];
    for (let index = 0; index < req.body.productNames.length; index++) {
        const element = req.body.productNames[index];
        productList.push(await GetProductId(element));
    }
    const loginCookie = await login("simon_krog_schroeder@hotmail.com", "PASSWORD_GOES_HERE");
    if (loginCookie === undefined) {
        return;
    }

    for (let index = 0; index < productList.length; index++) {
        const element: NemligProduct = productList[index];
        await addToBasket(loginCookie, element.Id);
    }

    return res.status(200).json("result");
}

async function addToBasket(cookie: string, productId: string) {
    const path = "/basket/AddToBasket";
    const result = await fetch(API_ROOT + path, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Cookie": cookie
        },
        body: JSON.stringify({
            ProductId: productId,
            quantity: 1
        })
    });
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%");
    console.log(result);
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%");
}

async function login(username: string, password: string) {
    const path = "/login";
    const result = await fetch(API_ROOT + path, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            Username: username,
            Password: password
        })
    });
    var loginCookie = result.headers.get("set-cookie");
    if (loginCookie === null) {
        return;
    } 
    const regexCookie = getCookie(loginCookie);
    if (regexCookie === undefined) {
        return
    }
    return regexCookie;
}

function getCookie(cookies: string) {
    const regex = new RegExp('(\\.ASPXAUTH=.*SameSite=Lax,)', 'gm')
    
    let m;
    
    while ((m = regex.exec(cookies)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        
        // The result can be accessed through the `m`-variable.
        if (m.length > 0) {
            return m[0];
        }
    }
}

async function GetProductId(productName: string) {
    const trimName = productName.trim();
    console.log(trimName)
    const path = '/s/0/1/0/Search/Search?query=';
    const result = await (await fetch(API_ROOT + path + trimName)).json();
    const parsed: NemligProduct = {Id: result.Products.Products[0].Id, Name: result.Products.Products[0].Name};
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%");
    console.log(parsed);
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%");
    return parsed;
}