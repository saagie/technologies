options(Ncpus = 8)
pkgs <- c(
	'argparse',
	'arulesSequences',
	'AUC',
	'breakpoint',
	'cairoDevice',
	'caretEnsemble',
	'cartography',
	'classInt',
	'DescTools',
	'doParallel',
	'doSNOW',
	'dtwclust',
	'factoextra',
	'FactoInvestigate',
	'FactoMineR',
	'Factoshiny',
	'FNN',
	'h2o',
	'LDAvis',
	'missMDA',
	'networkD3',
	'pROC',
	'prophet',
	'randomForest',
	'RcmdrMisc',
	'RColorBrewer',
	'Rcpp',
	'recommenderlab',
	'rJava',
	'RJDBC',
	'RMySQL',
	'ROCR',
	'ROSE',
	'RSelenium',
	'rsparkling',
	'Rtsne',
	'RWeka',
	'sas7bdat',
	'SnowballC',
	'syuzhet'
)

install.packages(pkgs) 
