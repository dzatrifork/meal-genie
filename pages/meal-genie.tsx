import Image from "next/image";
import Link from "next/link";
import {
  Card,
  Checkbox,
  Dropdown,
  Grid,
  Header,
  Label,
  Menu,
  Message
} from "semantic-ui-react";
import Layout from "../components/layout";
import MealGenieForm from "../components/meal-genie-form";
import MealPlanResult from "../components/meal-plan-result";
import NemligForm from "../components/nemlig-form";
import NemligTable from "../components/nemlig-table";
import { useMealPlanStore } from "../lib/store";
import useIsMobile from "../lib/useIsMobile";
import useUser from "../lib/useUser";

export default function MealGenie() {
  const store = useMealPlanStore();

  useUser({ redirectTo: "/login" });
  const isMobile = useIsMobile();

  return (
    <Layout>
      <div className="ui main container">
        <Menu inverted color="blue">
          <Dropdown
            item
            trigger={
              <>
                <Image
                  src={"/images/openai_logo.svg"}
                  alt="OpenAI"
                  width={120}
                  height={20}
                  style={{ width: "75px", marginRight: "5px" }}
                ></Image>{" "}
                Model
              </>
            }
          >
            <Dropdown.Menu>
              <Dropdown.Item
                onClick={() => store.setModel("gpt-4")}
                active={store.model === "gpt-4"}
              >
                GPT-4 <Label color="blue">gpt-4-8k</Label>
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => store.setModel("gpt-3.5-turbo-16k")}
                active={store.model === "gpt-3.5-turbo-16k"}
              >
                GPT-3.5 <Label color="blue">gpt-3.5-turbo-16k</Label>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Menu.Item position="right">
            {" "}
            <Link href={"https://openai.com/pricing"}>OpenAI Pricing</Link>
          </Menu.Item>
        </Menu>
        <Grid>
          <Grid.Column width={isMobile ? 16 : 11}>
            <Card fluid color="blue" raised>
              <Card.Content>
                <Card.Header>Define your meal plan!</Card.Header>
              </Card.Content>
              <MealGenieForm></MealGenieForm>
            </Card>
            <MealPlanResult></MealPlanResult>
          </Grid.Column>
          <Grid.Column width={isMobile ? 16 : 5}>
            <Card fluid>
              <Card.Content>
                <Header size="small">
                  Add shopping list to {" "}
                  <Image
                    id="nemlig-img"
                    src="/images/nemlig-web-logo.svg"
                    alt={"Nemlig.com"}
                    width={90}
                    height={80}
                  ></Image>
                </Header>
              </Card.Content>
              {store.ingredients != null ? (
                <NemligForm></NemligForm>
              ) : (
                <Card.Content>
                  <Message warning>
                    <p>
                      {" "}
                      Click <b>Generate meal plan</b> before you can send to
                      Nemlig.com
                    </p>
                  </Message>
                </Card.Content>
              )}
              {store.nemligOrder != null ? <NemligTable></NemligTable> : <></>}
            </Card>
          </Grid.Column>
        </Grid>
      </div>
    </Layout>
  );
}
