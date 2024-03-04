import React from 'react';

function ModeOption() {
    return (
        <>
            {/*
            <div className="question"><h4>Mode</h4></div>
            <div>
                <label><input type="radio" name="mode" value="cp" checked> vs AI</label>
                <label><input type="radio" name="mode" value="manual"> vs Human</label>
            </div>
            */}
            <div>
                <label><input type="hidden" name="mode" value="cp" checked /></label>
            </div>
        </>
    );
}

export default ModeOption;