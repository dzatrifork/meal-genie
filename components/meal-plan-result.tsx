import {
  Card,
  Container,
  Divider,
  Grid,
  Header,
  Item,
  Message,
  Placeholder,
  Table
} from "semantic-ui-react";
import { GptResult } from "./meal-genie-form";
import NewlineText from "./newline-text";

export default function MealPlanResult(props: {
  result: GptResult | null;
  loading: boolean;
}) {
  if (props.result == null) {
    return <></>;
  }

  return (
    <Card fluid>
      <Card.Content extra>
        <Container className="u-p-15">
          <Result result={props.result} loading={props.loading}></Result>
        </Container>
      </Card.Content>
    </Card>
  );
}

function Result(props: { result: GptResult | null; loading: boolean }) {
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
              <Item.Description as={"h5"}>{day.description}</Item.Description>
              <Divider hidden></Divider>
              <Grid columns={2} relaxed>
                <Grid.Column>
                  {day.directions != null ? (
                    <>
                      <Item.Description as={"h5"}>
                        Fremgangsmåde
                      </Item.Description>
                      <Item.Description>
                        <NewlineText text={day.directions}></NewlineText>
                      </Item.Description>
                    </>
                  ) : (
                    <></>
                  )}
                </Grid.Column>
                <Grid.Column>
                  {day.ingredients != null ? (
                    <>
                      <Item.Description as={"h5"}>
                        Ingredienser
                      </Item.Description>
                      <Item.Description>
                        <NewlineText text={day.ingredients}></NewlineText>
                      </Item.Description>
                    </>
                  ) : (
                    <></>
                  )}
                </Grid.Column>
              </Grid>
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

      {props.result?.ingredients?.map != null ? (
        <Item>
          <Item.Content>
            <Item.Description>
              <Table celled striped>
                <Table.Body>
                  {props.result.ingredients.map((ing, index) => (
                    <Table.Row key={index}>
                      <Table.Cell>{ing.name}</Table.Cell>
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
