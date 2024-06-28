// import BasicForm from "./components/01.BasicForm"
// import EnhancedForm from "./components/02.EnhancedForm"
import FormWithYup from "./components/03.FormWithYup"

const App = () => {
  return (
    <div className="flex justify-center items-center mt-5">
      <div className="container">
        <div className="row">
          <div className="col">
            {/* <BasicForm /> */}
            {/* <EnhancedForm /> */}
            <FormWithYup />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App
