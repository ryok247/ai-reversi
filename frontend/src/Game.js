import React from 'react';

function Game() {
    return (
    <div id="Game" className="tab-content active">
        <div className="container">
            <div className="row">
                <div className="col-md-4 col-12">
                    <div className="container container-for-options">
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
                
                        <div className="question"><h4>You are</h4></div>
                        <div className="container-for-players">
                            <label><input type="radio" name="color" value="black" checked /> First (Black)</label>
                            <label><input type="radio" name="color" value="white" /> Second (White)</label>
                        </div>
                
                        <div className="question"><h4>Level</h4></div>
                        <div className="container-for-levels">
                            <label><input type="radio" name="level" value={1} checked /> Very Easy</label>
                            <label><input type="radio" name="level" value={2} /> Easy</label>
                            <label><input type="radio" name="level" value={3} /> Medium</label>
                        </div>

                        {/* Checkbox that asks highlighting possible cells */}
                
                        <div className="container-for-button">
                            <button type="button" className="btn btn-primary" id="confirmed-btn">START</button>
                        </div>
                    </div>
                    <div className="container">
                        <form action="">
                            <input type="checkbox" id="highlight" name="highlight" value="checked" checked />
                            <label for="highlight"><h5>Highlight</h5></label>
                        </form>
                    </div>
                </div>
    
                <div className="col-md-5 col-12">
                    <div className="board">
                        {/* Game board will be generated here. */}
                    </div>
                </div>
    
                <div className="col-md-3 col-12">
                    <div className="container">
                        <div className="turn subsection">
                            <div className="info"><h4>Turn</h4></div>
                            <div id="turn">Black</div>
                        </div>
                        <div className="score subsection">
                            <div className="info"><h4>Score</h4></div>
                            <div>Black: <span id="black-score">2</span></div>
                            <div>White: <span id="white-score">2</span></div>
                        </div>
                        <div className="history subsection">
                            <div className="info"><h4>History</h4></div>
                            <div className="overflow-auto" style="max-height: 200px;">
                                <table className="history-table table table-striped table-bordered border-primary table-sm">
                                    <thead>
                                    <tr>   
                                        <th scope="col">#</th>
                                        <th scope="col">Player</th>
                                        <th scope="col">Position</th>
                                        <th scope="col">Time</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    </tbody>
                                </table>
                              </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
}

