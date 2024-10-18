var dagcomponentfuncs = (window.dashAgGridComponentFunctions = window.dashAgGridComponentFunctions || {});
console.log('dagcomponentfuncs = ', dagcomponentfuncs);
dagcomponentfuncs.StockLink = function (props) {
    console.log('props = ', props);
    return React.createElement(
        'a',
        {
            href: props.value,
            target : '_blank'
        },
        props.value
    );
};