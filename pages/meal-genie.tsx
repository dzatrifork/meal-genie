import '../semantic/dist/semantic.min.css';
import { Card, Dropdown } from 'semantic-ui-react'
import MealGenieForm from '../components/meal-genie-form';
import { useState } from 'react';

const options = [
  { key: '1', text: 'En', value: '1' },
  { key: '2', text: 'To', value: '2' },
  { key: '3', text: 'Tre', value: '3' },
  { key: '4', text: 'Fire', value: '4' },
  { key: '5', text: 'Fem', value: '5' },
  { key: '6', text: 'Seks', value: '6' },
  { key: '7', text: 'Syv', value: '7' },
]

export default function MealGenie() {
  return <>
    <div className="ui fixed inverted menu">
      <div className="ui container">
        <a href="" className="header item">
          Meal Genie
        </a>
      </div>
    </div>

    <div className="ui main container" style={{ marginTop: '50px' }}>
      <Card fluid>
        <Card.Content>
          <Card.Header>
            Definer din madplan!
          </Card.Header>
        </Card.Content>
        <MealGenieForm></MealGenieForm>
      </Card>
    </div>
  </>
}