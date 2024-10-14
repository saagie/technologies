var dagcomponentfuncs = (window.dashAgGridComponentFunctions = window.dashAgGridComponentFunctions || {});

dagcomponentfuncs.StockLink = function (props) {
    return React.createElement(
        'a',
        {
            //href: 'https://finance.yahoo.com/quote/' + props.value,
            href: props.value,
            target : '_blank'
        },
        props.value
    );
};