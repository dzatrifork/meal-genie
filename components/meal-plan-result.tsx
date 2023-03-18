import { Header, Item, Message, Placeholder, Table } from "semantic-ui-react";
import { GptResult } from "../pages/api/mealplan";

export default function MealPlanResult(props: { result: GptResult | null; loading: boolean }) {
    if (props.loading) {
      return (
        <Placeholder fluid>
          <Placeholder.Header>
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder.Header>
          <Placeholder.Paragraph>
            <Placeholder.Line length="full" />
            <Placeholder.Line length="full" />
            <Placeholder.Line length="full" />
            <Placeholder.Line length="full" />
          </Placeholder.Paragraph>
        </Placeholder>
      );
    }
    if (props.result == null) {
      return <Header size="small">Ingen madplan dannet.</Header>;
    }
    return (
      <Item.Group>
        {props.result.plan?.map != null ? (
          props.result.plan?.map((day, index) => (
            <Item key={index}>
              <Item.Content>
                <Item.Header>{day.day}</Item.Header>
                <Item.Description>{day.description}</Item.Description>
              </Item.Content>
            </Item>
          ))
        ) : (
          <Message error>Fejl i plan generering. Prøv igen...</Message>
        )}
        {props.result.ingredients?.map != null ? (
          <Item>
            <Item.Content>
              <Item.Description>
                <Table celled striped>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell colSpan="2">
                        Ingredienser
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {props.result.ingredients.map((ing, index) => (
                      <Table.Row key={index}>
                        <Table.Cell>{ing.name}</Table.Cell>
                        <Table.Cell>
                          {ing.quantity}
                          {ing.unit}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </Item.Description>
            </Item.Content>
          </Item>
        ) : (
          <Message error>Fejl i ingrediens generering. Prøv igen...</Message>
        )}
      </Item.Group>
    );
  }