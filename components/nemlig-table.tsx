import { Button, Form, Placeholder, Table } from "semantic-ui-react";
import { NemligResult } from "../pages/api/nemlig";


export default function NemligTable(props: {
  nemligResult: NemligResult;
  nemligLoading: boolean;
}) {
  if (props.nemligLoading) {
    return (
      <Placeholder>
        <Placeholder.Header>
          <Placeholder.Line />
          <Placeholder.Line />
        </Placeholder.Header>
        <Placeholder.Paragraph>
          <Placeholder.Line />
          <Placeholder.Line />
          <Placeholder.Line />
          <Placeholder.Line />
        </Placeholder.Paragraph>
      </Placeholder>
    );
  }
  return (
    <div>
      <Table celled striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell colSpan="2">
              Antal produkter: {props.nemligResult.itemsInBasket}, Total pris:{" "}
              {props.nemligResult.totalPrice} kr.
              <Form action="https://www.nemlig.com/basket">
                <Form.Field control={Button}>
                  Nemlig<i>buy</i>!
                </Form.Field>
              </Form>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {props.nemligResult.products.map((ing) => (
            <Table.Row key={ing.id} warning={ing.id === ""}>
              <Table.Cell>{ing.gptName}</Table.Cell>
              <Table.Cell>
                {ing.name === "" ? "IKKE FUNDET" : ing.name}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}