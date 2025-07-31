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
    const [filterText, setFilterText] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [alphabeticalOrder, setAlphabeticalOrder] = useState(false);

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
        if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
            dispatch({ type: 'RESET_FGD' });
            setFilterText(''); // Clear the filter text
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

            const trimmedFileName = fileName.trim();
            // Ensure the filename ends with .fgd, or add it if it doesn't.
            const finalFileName = trimmedFileName ? (trimmedFileName.endsWith('.fgd') ? trimmedFileName : `${trimmedFileName}.fgd`) : defaultFileName;

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

    // Memoize class type labels to avoid recreating the object on every render
    const CLASS_TYPE_LABELS = React.useMemo(() => ({
        BaseClass: 'Base',
        SolidClass: 'Solid',
        PointClass: 'Point',
    }), []);

    // Get unique class types from name-filtered entities
    const nameFilteredEntities = React.useMemo(() => {
        if (!state.entities) return [];
        return state.entities.filter(entity => {
            if (!entity.name) return false;
            return entity.name.toLowerCase().includes(filterText.toLowerCase());
        });
    }, [state.entities, filterText]);

    // Memoize ALL_CLASS_TYPES to avoid recreating the array on every render
    const ALL_CLASS_TYPES = React.useMemo(() => ['SolidClass', 'PointClass', 'BaseClass'], []);
    const baseClassExists = React.useMemo(() => {
        return state.entities.some(entity => Array.isArray(entity.baseClasses) && entity.baseClasses.length > 0);
    }, [state.entities]); // Dependency is correct
    const availableClassTypes = React.useMemo(() => {
        const presentTypes = new Set();
        nameFilteredEntities.forEach(entity => {
            if (entity.classType && CLASS_TYPE_LABELS[entity.classType]) {
                presentTypes.add(entity.classType);
            }
        });
        return ALL_CLASS_TYPES.map(type => ({
            type,
            label: CLASS_TYPE_LABELS[type],
            enabled: type === 'BaseClass' ? baseClassExists : presentTypes.has(type)
        }));
    }, [nameFilteredEntities, CLASS_TYPE_LABELS, baseClassExists, ALL_CLASS_TYPES]);

    const filteredAndSortedEntities = React.useMemo(() => {
        if (!state.entities) {
            return [];
        }

        const filtered = state.entities.filter(entity => {
            if (!entity.name) return false;
            const nameMatch = entity.name.toLowerCase().includes(filterText.toLowerCase());
            let typeMatch = true;
            if (filterType === 'SolidClass' || filterType === 'PointClass') {
                typeMatch = entity.classType === filterType;
            } else if (filterType === 'BaseClass') {
                typeMatch = Array.isArray(entity.baseClasses) && entity.baseClasses.length > 0;
            } else if (filterType === 'All') {
                typeMatch = true;
            } else {
                // Defensive: if filterType is unknown, don't match
                typeMatch = false;
            }
            return nameMatch && typeMatch;
        });

        if (alphabeticalOrder) {
            return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        } else {
            // Preserve original order (drag-and-drop order)
            return filtered;
        }
    }, [state.entities, filterText, filterType, alphabeticalOrder]);

    // Add this to your top-level render:
    React.useEffect(() => {
        document.body.className = theme; // 'dark' or 'light'
    }, [theme]);

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
                    <button
                        onClick={() => setIsDragModeEnabled(prev => !prev)}
                        className={isDragModeEnabled ? 'drag-mode-active' : ''}
                        aria-pressed={isDragModeEnabled}
                    >
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
                    <div className="entity-list-header-section">
                        <div className="entity-list-sorting-controls">
                            <button
                                onClick={() => setAlphabeticalOrder((prev) => !prev)}
                                className={`alphabetical-order-btn ${alphabeticalOrder ? 'alphabetical-active' : ''}`}
                                aria-pressed={alphabeticalOrder}
                            >
                                Alphabetical Order{alphabeticalOrder ? ' (On)' : ' (Off)'}
                            </button>
                        </div>
                    </div>
                    <div className="entity-list-controls">
                        <input
                            type="text"
                            placeholder="Filter by name..."
                            value={filterText}
                            onChange={(e) => {
                                setFilterText(e.target.value);
                                // setFilterType('All'); // Remove this line!
                            }}
                            aria-label="Filter entities by name"
                        />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            aria-label="Filter entities by type"
                        >
                            <option value="All">All Types</option>
                            {availableClassTypes.map(({ type, label, enabled }) => (
                                <option key={type} value={type} disabled={!enabled}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <EntityList entities={filteredAndSortedEntities} isDragModeEnabled={isDragModeEnabled} />
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