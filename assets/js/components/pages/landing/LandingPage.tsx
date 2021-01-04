import React from "react";
import { MainMenu } from "./MainMenu";
import { Main } from "../../common/Main";

const LandingPage: React.FC = () => {
  return (
    <Main>
      <section className="row">
        <article className="column">
          <h2>MidiJam</h2>
          <MainMenu />
        </article>
      </section>
    </Main>
  );
};
export { LandingPage };
