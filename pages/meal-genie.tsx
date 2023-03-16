import { useRef, useState } from 'react';
import { Button, Card, Container, Form, Grid, Header, Item, List, Menu, Message, Placeholder, Table } from 'semantic-ui-react';
import Image from 'next/image';
import MealGenieForm, { RefType } from '../components/meal-genie-form';
import NemligForm from '../components/nemlig-form';
import '../semantic/dist/semantic.min.css';
import { GptResult } from './api/mealplan';
import { NemligProduct, NemligResult } from './api/nemlig';
import Head from 'next/head';

function Result(props: { result: GptResult | null, loading: boolean }) {
  if (props.loading) {
    return <Placeholder fluid>
      <Placeholder.Header>
        <Placeholder.Line />
        <Placeholder.Line />
      </Placeholder.Header>
      <Placeholder.Paragraph>
        <Placeholder.Line length='full' />
        <Placeholder.Line length='full' />
        <Placeholder.Line length='full' />
        <Placeholder.Line length='full' />
      </Placeholder.Paragraph>
    </Placeholder>
  }
  if (props.result == null) {
    return <Header size='small'>Ingen madplan dannet.</Header>
  }
  return <Item.Group>

    {
      props.result.plan?.map != null
        ?
        props.result.plan?.map(day =>
          <Item>
            <Item.Content>
              <Item.Header>{day.day}</Item.Header>
              <Item.Description>{day.description}</Item.Description>
            </Item.Content>
          </Item>
        )
        :
        <Message error>Fejl i plan generering. Prøv igen...</Message>
    }
    {props.result.ingredients?.map != null
      ?
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
                    <Table.Cell>{ing.name}</Table.Cell>
                    <Table.Cell>{ing.quantity}{ing.unit}</Table.Cell>
                  </Table.Row>)}
              </Table.Body>
            </Table>
          </Item.Description>
        </Item.Content>
      </Item>
      :
      <Message error>Fejl i ingrediens generering. Prøv igen...</Message>

    }

  </Item.Group>
}

function NemligTable(props: { nemligResult: NemligResult, nemligLoading: boolean }) {
  if (props.nemligLoading) {
    return <Placeholder >
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
  return <div>
    <Table celled striped>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell colSpan='2'>Antal produkter: {props.nemligResult.ItemsInBasket}, Total pris: {props.nemligResult.TotalPrice} kr.
            <Form action="https://www.nemlig.com/basket">
              <Form.Field control={Button}>Nemlig<i>buy</i>!</Form.Field>
            </Form>
          </Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {props.nemligResult.Products.map(ing =>
          <Table.Row warning={ing.Id === ""}>
            <Table.Cell>{ing.GptName}</Table.Cell>
            <Table.Cell>{ing.Name === "" ? "IKKE FUNDET" : ing.Name}</Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  </div>
}

export default function MealGenie() {
  const mealGenieRef = useRef<RefType>(null);
  const [result, setResult] = useState<GptResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [nemligResult, setNemligResult] = useState<NemligResult | null>(null);
  const [nemligLoading, setNemligloading] = useState<boolean>(false);
  const [model, setModel] = useState<string>('gpt3');


  return <>
    <Head>
      <link rel="icon" type="image/png" sizes="32x32" href="/images/logo.png"/>
      <meta name="title" content="MealGenie"/>
    </Head>
    <Menu fixed='top' inverted color='blue'>
      <Menu.Item header><Image src={'/images/logo_transparent.svg'}  style={{width: '45px !important', marginRight: '15px'}} alt="''" width={45} height={45}></Image>Meal Genie</Menu.Item>
      <Menu.Item onClick={() => setModel('gpt3')} active={model === 'gpt3'}>GPT3.5</Menu.Item>
      <Menu.Item onClick={() => setModel('davinci')} active={model === 'davinci'}>DaVinci</Menu.Item>
    </Menu>

    <div className="ui main container">
      <Grid>
        <Grid.Column width={11}>
          <Card fluid>
            <Card.Content>
              <Card.Header>
                Definer din madplan!
              </Card.Header>
            </Card.Content>
            <MealGenieForm model={model} result={setResult} loading={setLoading}></MealGenieForm>
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
            {result != null
              ?
              <NemligForm mealPlan={result} nemligResult={setNemligResult} nemLigloading={setNemligloading}></NemligForm>
              :
              <Card.Content>
                <Message warning>
                  <Message.Header>Tryk på 'Opret madplan'</Message.Header>
                  <p>Opret madplan før du kan sende til Nemlig.com</p>

                </Message>
              </Card.Content>
            }
            {nemligResult != null ?
              <NemligTable nemligResult={nemligResult} nemligLoading={nemligLoading}></NemligTable>
              : <></>
            }
          </Card>
        </Grid.Column>
      </Grid>

    </div>
  </>
}