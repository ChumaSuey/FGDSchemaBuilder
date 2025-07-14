import React, { useRef, useState } from 'react';
import { FGDProvider, useFGD } from './context/FGDContext';
import { parseFGD } from './core/FGDParser.js';
import { generateFGD } from './core/FGDgenerator.js';
import { EntityList } from './components/EntityList';
import { EntityEditor } from './components/EntityEditor';
import { FGDPreview } from './components/FGDPreview';
import './App.css';

/**
 * The main builder component that contains the layout and logic.
 * It's separated from App to have access to the context provided by FGDProvider.
 */
const FGDBuilder = () => {
    const { state, dispatch } = useFGD();
    const fileInputRef = useRef(null);
    const [theme, setTheme] = useState('dark'); // Defaulting to dark as per user preference
    const [isDragModeEnabled, setIsDragModeEnabled] = useState(false);

    const toggleTheme = () => {
        setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));
    };

    const handleImportClick = () => {
        // Trigger the hidden file input
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            try {
                const parsedSchema = parseFGD(text);
                dispatch({ type: 'LOAD_FGD', payload: parsedSchema });
            } catch (error) {
                console.error('Failed to parse FGD file:', error);
                alert('Error parsing FGD file. See console for details.');
            }
        };
        reader.readAsText(file);

        // Reset the input value to allow re-uploading the same file
        e.target.value = null;
    };

    const handleReset = () => {
        // It's good practice to confirm destructive actions.
        if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
            dispatch({ type: 'RESET_FGD' });
        }
    };


    const handleExport = () => {
        try {
            const fgdText = generateFGD(state);
            const defaultFileName = 'my_game.fgd';
            const fileName = window.prompt('Enter a filename for your FGD file:', defaultFileName);

            if (fileName === null) {
                // User cancelled the prompt
                return;
            }

            // Ensure the filename ends with .fgd, or add it if it doesn't.
            const finalFileName = fileName.trim() ? (fileName.endsWith('.fgd') ? fileName : `${fileName}.fgd`) : defaultFileName;

            const blob = new Blob([fgdText], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = finalFileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to generate FGD file:', error);
            alert('Error generating FGD file. See console for details.');
        }
    };

    return (
        <div className={`app-container ${theme}`}>
            <header className="app-header">
                <h1>FGD Schema Builder</h1>
                <div className="app-actions">
                    <button onClick={handleImportClick}>Import FGD</button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        accept=".fgd"
                    />
                    <button onClick={handleExport}>Export FGD</button>
                    <button onClick={() => setIsDragModeEnabled(prev => !prev)} className={isDragModeEnabled ? 'drag-mode-active' : ''}>
                        Drag Mode: {isDragModeEnabled ? 'On' : 'Off'}
                    </button>
                    <button onClick={handleReset}>Reset</button>
                    <button onClick={toggleTheme}>
                        Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
                    </button>
                </div>
            </header>
            <main className="main-layout">
                <div className="panel panel-list">
                    <EntityList isDragModeEnabled={isDragModeEnabled} />
                </div>
                <div className="panel panel-editor">
                    <EntityEditor />
                </div>
                <div className="panel panel-preview">
                    <FGDPreview />
                </div>
            </main>
        </div>
    );
};

// The App component's primary role is to provide the context.
function App() {
    return (
        <FGDProvider>
            <FGDBuilder />
        </FGDProvider>
    );
}

export default App;