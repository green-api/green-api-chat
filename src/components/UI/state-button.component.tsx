import { StateButtonParametersInterface } from 'types';

const StateButton = ({ setState, children }: StateButtonParametersInterface) => {
  return (
    <div
      className="cursor-pointer"
      onClick={(event) => {
        event.stopPropagation();

        setState((previousState) => !previousState);
      }}
    >
      {children}
    </div>
  );
};

export default StateButton;
