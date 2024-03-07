import React from 'react';
import { useSelector } from 'react-redux';

function OpenAIComment() {

    const language = useSelector((state) => state.language.language);

    return (
        <div class="flex-container">
            <div className = "container-for-openai-comment">
                <h4>{language==="en" ? "Comment powered by GPT3.5 Turbo" : "GPT3.5 Turboによるコメント"}</h4>
                <div id="openai-comment"></div>
            </div>
        </div>
    );
}

export default OpenAIComment;