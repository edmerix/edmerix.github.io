function T = explainSEvsSD(nSpace,mu,sigma,doPlot)
% A quick function to highlight why stats should usually be reported as
% mean ± SD in papers rather than mean ± SEM. Effectively, as observations
% go up, SEM decreases, even while SD is stable, thereby highlighting how,
% while the two are related, SD gives an estimate of the distribution of a
% population, while SE gives an estimate of how "accurate" our calculation
% of the mean of that distribution is, not telling us directly what the
% distribution is (clearly if we know N, we can work it out, but that is
% difficult to do from a figure that erroneously plotted mean ± SEM).
%
% See Nagele, BJI, 2003 (doi:10.1093/bja/aeg087) for more information.
%
% INPUTS:
%   1: vector of N-values to calculate across. 
%       DEFAULT: [100 1000 10000]
%   2: "true" mean of the distribution the observations are coming from
%       DEFAULT: 0
%   3: "true" standard deviation of the distribution the observations are
%       coming from
%       DEFAULT: 1
%   4: Whether or not to show a plot as well as the output table (boolean)
%       Note that since the SD is always larger, to see how the SE
%       collapses you will need to zoom in on the y-axis.
%       DEFAULT: false
%
% OUTPUT:
%   A table of the results, which is also printed to the command window.
%   Note how, unless the N values are very small, the observed mean and SDs
%   are stable, while the SE decreases as the number of observations
%   increases.
%
% E.M.Merricks, Ph.D., 2021-12-05

if nargin < 1 || isempty(nSpace)
    nSpace = [100 1000 10000];
end
if nargin < 2 || isempty(mu)
    mu = 0;
end
if nargin < 3 || isempty(sigma)
    sigma = 1;
end
if nargin < 4 || isempty(doPlot)
    doPlot = false;
end

meanVals = NaN(1,length(nSpace));
sdVals = NaN(1,length(nSpace));
seVals = NaN(1,length(nSpace));
rowLabels = cell(1,length(nSpace));
for n = 1:length(nSpace)
    pop = (sigma.*randn(nSpace(n),1)) + mu;
    meanVals(n) = mean(pop);
    sdVals(n) = std(pop);
    seVals(n) = sdVals(n)./sqrt(nSpace(n));
    rowLabels{n} = ['N = ' num2str(nSpace(n))];
end
T = table(meanVals', sdVals', seVals',...
    'VariableNames', {'Observed_mean','Observed_SD','Observed_SE'},...
    'RowNames', rowLabels);

disp(['Using populations with expected mean = ' num2str(mu) ' and SD = ' num2str(sigma) ':']);
disp(T);

if doPlot
    figure
    hold on
    m = plot(nSpace,meanVals,'linewidth',4,'color','k');
    sd = plot(nSpace,meanVals + sdVals,'linewidth',2,'color',[0.2 0.2 0.2],'linestyle','--');
    plot(nSpace,meanVals - sdVals,'linewidth',2,'color',[0.2 0.2 0.2],'linestyle','--')
    se = plot(nSpace,meanVals + seVals,'linewidth',2,'color',[0.2 0.2 0.2],'linestyle',':');
    plot(nSpace,meanVals - seVals,'linewidth',2,'color',[0.2 0.2 0.2],'linestyle',':')
    
    lg = legend([m sd se],'Mean','SD','SE');
    lg.EdgeColor = 'none';
    lg.Color = 'none';
    
    xlabel('Number of observations')
    ylabel('Mean ± SD and SE')
end
