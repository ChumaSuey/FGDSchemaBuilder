import React, { useState } from 'react';
import { useFGD } from '../context/FGDContext';
import { generateFGD } from '../core/FGDgenerator.js';
// import './FGDPreview.css'; // For styling later

export const FGDPreview = () => {
    const { state } = useFGD();
    const [copyButtonText, setCopyButtonText] = useState('Copy to Clipboard');

    // Generate the FGD text from the current state
    const fgdText = generateFGD(state);

    const handleCopy = () => {
        navigator.clipboard.writeText(fgdText).then(
            () => {
                setCopyButtonText('Copied!');
                setTimeout(() => setCopyButtonText('Copy to Clipboard'), 2000);
            },
            (err) => {
                console.error('Could not copy text: ', err);
                setCopyButtonText('Error!');
                setTimeout(() => setCopyButtonText('Copy to Clipboard'), 2000);
            }
        );
    };

    return (
        <div className="fgd-preview-panel">
            <header className="fgd-preview-header">
                <h2>FGD Preview</h2>
                <button onClick={handleCopy} className="copy-btn">
                    {copyButtonText}
                </button>
            </header>
            <pre className="fgd-output">
                <code>{fgdText}</code>
            </pre>
        </div>
    );
};