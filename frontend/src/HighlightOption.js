function HighlightOption() {
  return (
    <div className="container">
      <form action="">
        <input type="checkbox" id="highlight" name="highlight" value="checked" defaultChecked />
        <label htmlFor="highlight"><h5>Highlight</h5></label>
      </form>
    </div>
  );
}

export default HighlightOption;