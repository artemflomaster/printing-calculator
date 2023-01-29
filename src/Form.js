import { saveAs } from 'file-saver';

export default function Form(props) {
    function saveFileHandler() {
        saveAs("./test.stl", "calc.stl");
      }
    const getTheFile = 0;

    return (
        <div className="form">
            <form>

                {/* <label for='file'>Выберете файл</label>
                <input type='file' id='file' name='file'/> */}
                <button onClick={getTheFile}>Загрузить файл</button>

            </form>



        </div>
    );
}