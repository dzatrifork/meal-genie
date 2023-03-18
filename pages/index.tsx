import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Container, Image, Transition } from "semantic-ui-react";
import Layout from "../components/layout";
import "../semantic/dist/semantic.min.css";

export default function Home() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    router.push("/meal-genie");
  });

  return (
    <Layout>
      <Container fluid textAlign="center">
        <Transition animation="bounce" duration={1000} visible={visible}>
          <Image
            onClick={() => setVisible(!visible)}
            src="/images/logo_transparent.svg"
            alt="''"
            style={{ margin: "auto", marginTop: "20%" }}
          ></Image>
        </Transition>
      </Container>
    </Layout>
  );
}
