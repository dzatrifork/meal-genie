import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Card, Grid, Header, Label, Menu, Message } from "semantic-ui-react";
import Layout from "../components/layout";
import MealGenieForm, { GptResult } from "../components/meal-genie-form";
import MealPlanResult from "../components/meal-plan-result";
import NemligForm from "../components/nemlig-form";
import NemligTable from "../components/nemlig-table";
import useUser from "../lib/useUser";
import { NemligResult } from "./api/nemlig";

export default function MealGenie() {
  const [result, setResult] = useState<GptResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [nemligResult, setNemligResult] = useState<NemligResult | null>(null);
  const [nemligLoading, setNemligloading] = useState<boolean>(false);
  const [model, setModel] = useState<string>("gpt-4");

  useUser({ redirectTo: "/login" });

  return (
    <Layout>
      <div className="ui main container">
        <Menu inverted color="blue">
          <Menu.Item header>
            <Image
              src={"/images/openai_logo.svg"}
              alt="OpenAI"
              width={120}
              height={20}
              style={{ width: "75px", marginRight: "5px" }}
            ></Image>{" "}
            Model
          </Menu.Item>
          <Menu.Item
            onClick={() => setModel("gpt-4")}
            active={model === "gpt-4"}
          >
            GPT-4 <Label color="blue">gpt-4-8k</Label>
          </Menu.Item>
          <Menu.Item
            onClick={() => setModel("gpt-3.5-turbo")}
            active={model === "gpt-3.5-turbo"}
          >
            ChatGPT <Label color="blue">gpt-3.5-turbo</Label>
          </Menu.Item>
          <Menu.Item
            onClick={() => setModel("davinci")}
            active={model === "davinci"}
          >
            InstructGPT <Label color="blue">davinci</Label>
          </Menu.Item>
          <Menu.Item position="right">
            {" "}
            <Link href={"https://openai.com/pricing"}>OpenAI Pricing</Link>
          </Menu.Item>
        </Menu>
        <Grid>
          <Grid.Column width={11}>
            <Card fluid color="blue" raised>
              <Card.Content>
                <Card.Header>Definer din madplan!</Card.Header>
              </Card.Content>
              <MealGenieForm
                model={model}
                result={setResult}
                loading={setLoading}
              ></MealGenieForm>
            </Card>
            <MealPlanResult result={result} loading={loading}></MealPlanResult>
          </Grid.Column>
          <Grid.Column width={5}>
            <Card fluid>
              <Card.Content>
                <Header size="small">
                  Føj indkøbslisten til{" "}
                  <Image
                    id="nemlig-img"
                    src="/images/nemlig-web-logo.svg"
                    alt={"Nemlig.com"}
                    width={90}
                    height={80}
                  ></Image>
                </Header>
              </Card.Content>
              {result?.ingredients != null ? (
                <NemligForm
                  mealPlan={result}
                  nemligResult={setNemligResult}
                  nemLigloading={setNemligloading}
                ></NemligForm>
              ) : (
                <Card.Content>
                  <Message warning>
                    <p>
                      {" "}
                      Tryk på <b>Opret madplan</b> før du kan sende til
                      Nemlig.com
                    </p>
                  </Message>
                </Card.Content>
              )}
              {nemligResult != null ? (
                <NemligTable
                  nemligResult={nemligResult}
                  nemligLoading={nemligLoading}
                ></NemligTable>
              ) : (
                <></>
              )}
            </Card>
          </Grid.Column>
        </Grid>
      </div>
    </Layout>
  );
}
