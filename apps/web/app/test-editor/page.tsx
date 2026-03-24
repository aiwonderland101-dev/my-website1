'use client';

import React from 'react';
import WebGLStudioViewer from '@/components/WebGLStudioViewer';

const TestEditorPage = () => {
    // The path to your editor's index.html
    const editorSrc = '/webglstudio/webglstudio.js-master/editor/index.html';

    return (
        <div>
            <h1>WebGLStudio Editor Test</h1>
            <p>This page embeds the WebGLStudio editor in a React component.</p>
            <WebGLStudioViewer src={editorSrc} />
        </div>
    );
};

export default TestEditorPage;
