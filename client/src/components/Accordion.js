import AccordionPanel from "./AccordionPanel";

const Accordion = ({ tweets }) => {
  return (
    <>
      {tweets.map((tweet) => (
        <AccordionPanel key={"panel-" + tweet.id} tweet={tweet} />
      ))}
    </>
  );
};

export default Accordion;
