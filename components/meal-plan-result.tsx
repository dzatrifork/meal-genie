import { useState } from "react";
import {
  Accordion,
  Card,
  Container,
  Divider,
  Grid,
  Header,
  Icon,
  Item,
  Message,
  Placeholder,
  Table,
} from "semantic-ui-react";
import { useMealPlanStore } from "../lib/store";
import useIsMobile from "../lib/useIsMobile";
import NewlineText from "./newline-text";
import { Meal, Plan } from "../lib/mealPlanSchema";

export default function MealPlanResult() {
  const store = useMealPlanStore();
  if (store.plan == null) {
    return <></>;
  }

  return (
    <Card fluid>
      <Card.Content extra>
        <Container className="u-p-15">
          <Result result={store.plan} loading={store.loading}></Result>
        </Container>
      </Card.Content>
    </Card>
  );
}

function DayResult(props: { meal: Meal }) {
  const meal = props.meal;
  const [active, setActive] = useState<boolean>(true);

  const isMobile = useIsMobile();

  return (
    <>
      <Accordion.Title
        icon="dropdown"
        index={0}
        onClick={() => setActive(!active)}
        active={active}
      >
        <Icon name="dropdown" />
        {meal.description}
      </Accordion.Title>
      <Accordion.Content active={active}>
        <Grid columns={2} relaxed>
          <Grid.Column width={isMobile ? 16 : undefined}>
            {meal.directions != null ? (
              <>
                <Item.Description as={"h5"}>Fremgangsmåde</Item.Description>
                <Item.Description>
                  <NewlineText text={meal.directions}></NewlineText>
                </Item.Description>
              </>
            ) : (
              <></>
            )}
          </Grid.Column>
          <Grid.Column>
            {meal.ingredients != null ? (
              <>
                <Item.Description as={"h5"}>Ingredienser</Item.Description>
                {meal.ingredients.map((ing, index) => (
                  <Item.Description key={index}>
                    {ing.quantity}{ing.unit != null ? " " + ing.unit : ""} {ing.name} 
                  </Item.Description>
                ))}
              </>
            ) : (
              <></>
            )}
          </Grid.Column>
        </Grid>
      </Accordion.Content>
    </>
  );
}

function Result(props: { result: Plan | null; loading: boolean }) {
  return (
    <Item.Group>
      <Divider horizontal>
        <Header>Madplan</Header>
      </Divider>
      {props.result?.plan?.map != null ? (
        props.result.plan.map((day, index) => (
          <Item key={index}>
            <Item.Content>
              <Divider horizontal>{day.day}</Divider>
              <Accordion styled fluid>
                {day.meals != null ? (
                  day.meals.map((meal, index) => (
                    <DayResult meal={meal} key={index}></DayResult>
                  ))
                ) : (
                  <></>
                )}
              </Accordion>
            </Item.Content>
          </Item>
        ))
      ) : (
        <Item>
          <Item.Content>
            <Item.Description>
              {props.loading ? (
                <Placeholder fluid>
                  <Placeholder.Header>
                    <Placeholder.Line />
                  </Placeholder.Header>
                  <Placeholder.Paragraph>
                    <Placeholder.Line length="full" />
                    <Placeholder.Line length="long" />
                  </Placeholder.Paragraph>
                  <Placeholder.Header>
                    <Placeholder.Line />
                  </Placeholder.Header>
                  <Placeholder.Paragraph>
                    <Placeholder.Line length="full" />
                    <Placeholder.Line length="short" />
                  </Placeholder.Paragraph>
                </Placeholder>
              ) : (
                <Message error>Fejl i plan generering. Prøv igen...</Message>
              )}
            </Item.Description>
          </Item.Content>
        </Item>
      )}
      <Divider horizontal>
        <Header>Indkøbsliste</Header>
      </Divider>

      {props.result?.allIngredients?.map != null ? (
        <Item>
          <Item.Content>
            <Item.Description>
              <Table celled striped>
                <Table.Body>
                  {props.result.allIngredients.map((ing, index) => (
                    <Table.Row key={index}>
                      <Table.Cell>
                        {ing.name[0].toUpperCase() + ing.name.slice(1)}
                      </Table.Cell>
                      <Table.Cell>
                        {ing.quantity} {ing.unit}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </Item.Description>
          </Item.Content>
        </Item>
      ) : (
        <Item>
          <Item.Content>
            <Item.Description>
              {props.loading ? (
                <Placeholder fluid>
                  <Placeholder.Header>
                    <Placeholder.Line length="full" />
                  </Placeholder.Header>
                  <Placeholder.Paragraph>
                    <Placeholder.Line length="full" />
                    <Placeholder.Line length="full" />
                    <Placeholder.Line length="full" />
                    <Placeholder.Line length="full" />
                  </Placeholder.Paragraph>
                </Placeholder>
              ) : (
                <Message error>
                  Fejl i ingrediens generering. Prøv igen...
                </Message>
              )}
            </Item.Description>
          </Item.Content>
        </Item>
      )}
    </Item.Group>
  );
}
