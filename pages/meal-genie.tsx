import { useRef, useState } from 'react';
import { Card, Container, Grid, Header, Item, List, Message, Placeholder, Table } from 'semantic-ui-react';
import Image from 'next/image';
import MealGenieForm, { RefType } from '../components/meal-genie-form';
import NemligForm from '../components/nemlig-form';
import '../semantic/dist/semantic.min.css';
import { GptResult } from './api/mealplan';

function Result(props: { result: GptResult | null, loading: boolean }) {
  if (props.loading) {
    return <Placeholder>
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
  }
  if (props.result == null) {
    return <Header size='small'>Ingen madplan dannet</Header>
  }
  return <Item.Group>
    <Item>
      <Item.Content>
        <Item.Header>Plan</Item.Header>
        <Item.Description>
          {props.result.plan}
        </Item.Description>
      </Item.Content>
    </Item>

    <Item>
      <Item.Content>
        <Item.Description>
          <Table celled striped>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell colSpan='2'>Ingredienser</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {props.result.ingredients.map(ing =>
                <Table.Row>
                  <Table.Cell>{ing.navn}</Table.Cell>
                  <Table.Cell>{ing.mængde}{ing.enhed}</Table.Cell>
                </Table.Row>)}
            </Table.Body>
          </Table>
        </Item.Description>
      </Item.Content>
    </Item>
  </Item.Group>
}

export default function MealGenie() {
  const mealGenieRef = useRef<RefType>(null);
  const [result, setResult] = useState<GptResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);


  return <>
    <div className="ui fixed inverted menu blue massive">
      <div className="ui container">
        <a href="" className="header item">
          Meal Genie
        </a>
      </div>
    </div>

    <div className="ui main container">
      <Grid>
        <Grid.Column width={11}>
          <Card fluid>
            <Card.Content>
              <Card.Header>
                Definer din madplan!
              </Card.Header>
            </Card.Content>
            <MealGenieForm result={setResult} loading={setLoading}></MealGenieForm>
            <Card.Content extra>
              <Container className='u-p-15'>
                <Result result={result} loading={loading}></Result>
              </Container>
            </Card.Content>
          </Card>
        </Grid.Column>
        <Grid.Column width={5}>
          <Card fluid>
            <Card.Content>
              <Header size='small'>
                Export to <Image id='nemlig-img' src='/images/nemlig-web-logo.svg' alt={'Nemlig.com'} width={90} height={90}></Image>
              </Header>
            </Card.Content>
            { result != null 
            ? 
            <NemligForm mealPlan={result}></NemligForm> 
            : 
            <Card.Content>
              <Message warning>
                <Message.Header>Tryk på 'Opret madplan'</Message.Header>
                <p>Opret madplan før du kan sende til Nemlig.com</p>
                
                </Message>
            </Card.Content>
            }
            
          </Card>
        </Grid.Column>
      </Grid>


    </div>
  </>
}