import Link from "next/link";
import React, { ChangeEvent, useState } from "react";
import {
  Card,
  Container,
  Form,
  Input,
  InputOnChangeData,
} from "semantic-ui-react";
import Layout from "../components/layout";
import fetchJson, { FetchError } from "../lib/fetchJson";
import useUser from "../lib/useUser";

export default function Login() {
  // here we just check if user is already logged in and redirect to profile
  const { mutateUser } = useUser({
    redirectTo: "/meal-genie",
    redirectIfFound: true,
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [key, setKey] = useState("");

  return (
    <Layout>
        <Container fluid className="login" text>
          <Card fluid>
            <Card.Content>
              <Card.Header>Login</Card.Header>
            </Card.Content>
            <Card.Content>
              <Card.Description>An OpenAI API key is needed to use Meal Genie. Go to <Link target={'_blank'} href={'https://platform.openai.com/account/api-keys'}>OpenAI account settings</Link> to generate one.</Card.Description>
            </Card.Content>
            <Card.Content>
              <Form
                error={errorMsg != ""}
                onSubmit={async function handleSubmit(event) {
                  event.preventDefault();

                  const body = {
                    openaiApiKey: key,
                  };

                  try {
                    mutateUser(
                      await fetchJson("/api/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                      })
                    );
                  } catch (error) {
                    if (error instanceof FetchError) {
                      setErrorMsg(error.data.message);
                    } else {
                      console.error("An unexpected error happened:", error);
                    }
                  }
                }}
              >
                <Form.Input
                  label="OpenAI API key"
                  name="key"
                  control={Input}
                  onChange={(event: ChangeEvent, data: InputOnChangeData) =>
                    setKey(data.value)
                  }
                />
                <Form.Button content="Login" />
              </Form>
            </Card.Content>
          </Card>
        </Container>
    </Layout>
  );
}
