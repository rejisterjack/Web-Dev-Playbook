// import BasicForm from "./components/01.BasicForm"
// import EnhancedForm from "./components/02.EnhancedForm"
// import FormWithYup from "./components/03.FormWithYup"
import FormWithZod from "./components/04.FormWithZod"
import FluentComp from "./components/05.FluentComp"

const App = () => {
  return (
    <div className="flex justify-center items-center mt-5">
      <div className="container">
        <div className="row">
          <div className="col">
            {/* <BasicForm /> */}
            {/* <EnhancedForm /> */}
            {/* <FormWithYup /> */}
            {/* <FormWithZod /> */}
            <FluentComp />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App
