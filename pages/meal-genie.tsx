import { useEffect, useRef, useState } from 'react';
import { Card } from 'semantic-ui-react';
import MealGenieForm, { RefType } from '../components/meal-genie-form';
import '../semantic/dist/semantic.min.css';
import { GptResult } from './api/mealplan';

export default function MealGenie() {
  const mealGenieRef = useRef<RefType>(null);
  const [result, setResult] = useState<GptResult | null>(null);

  useEffect(() => {
    if (mealGenieRef.current) {
      setResult(mealGenieRef.current.result);
    }
  }, []);

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
        <MealGenieForm ref={mealGenieRef}></MealGenieForm>
        <Card.Content extra>
            Resultat: {JSON.stringify(result)},
        </Card.Content>
      </Card>
    </div>
  </>
}