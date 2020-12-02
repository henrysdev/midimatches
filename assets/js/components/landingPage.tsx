import React from "react";
import MainMenu from "./mainMenu";

const LandingPage: React.FC = () => {
  return (
    <section className="row">
      <article className="column">
        <h2>MidiJam</h2>
        <MainMenu/>
      </article>
    </section>
  );
};
export default LandingPage;