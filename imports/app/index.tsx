import * as React from 'react';
import { render } from 'react-dom'
import { Meteor } from 'meteor/meteor';

const App = () => <h1>Hallo, Welt!</h1>

Meteor.startup(() => {
  render(<App />, document.getElementById("root"));
})