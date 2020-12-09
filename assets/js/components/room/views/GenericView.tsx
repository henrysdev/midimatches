import React from "react";
import { SimpleButton } from "../../common/index";
import { GAME_VIEW } from "../../../constants/index";

interface GenericViewProps {
  currentView: GAME_VIEW;
  nextViewCallback: Function;
}
const GenericView: React.FC<GenericViewProps> = ({
  currentView,
  nextViewCallback,
}) => {
  return (
    <>
      <h1>{currentView}</h1>
      <SimpleButton
        label="next state"
        callback={() => nextViewCallback()}
        disabled={false}
      />
    </>
  );
};
export { GenericView };
