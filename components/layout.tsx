import Head from "next/head";
import Image from "next/image";
import { Menu } from "semantic-ui-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Head>
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/images/logo.png"
        />
        <title>MealGenie</title>
      </Head>
      <main>
      <Menu fixed="top" inverted secondary color="green" style={{height: '50px'}}>
        <Menu.Item header>
          <Image
            src={"/images/logo_transparent.svg"}
            style={{ width: "40px !important", marginRight: "15px" }}
            alt="''"
            width={55}
            height={75}
          ></Image>
          Meal Genie
        </Menu.Item>
      </Menu>
        <div className="container">{children}</div>
      </main>
    </>
  );
}
