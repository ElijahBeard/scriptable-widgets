async function createWidget() {
    let widget = new ListWidget();
    widget.backgroundColor = new Color("#1a1a1a");
}

if (config.runsInWidget) {
    let widget = await createWidget();
    Script.setWidget(widget);
} else {
    let widget = await createWidget();
    widget.presentSmall();
}

Script.complete();