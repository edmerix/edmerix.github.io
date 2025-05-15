% Code to create a "fly-through" animation entirely in matlab
% E.M. Merricks, Ph.D. 2020 (updated 2025)

%% Set up the scene:
% choose whether or not to show randomly-sampled data points to fly through
% as an example:
showRandomData = true;
% if above is true, set how many data points to create:
nPoints = 5e3;
% set a frame rate for the animation:
frameRate = 60;

% create the figure and store handles to it and its main axes element:
hfig = figure('Position',[100 100 860 430]);
ax = gca;

% store some axis limits so that the flying view is correctly constrained:
axLimits = [-pi pi; -120 300; -150 100];

% if requested, create the random data to display:
if showRandomData
    % x and z dimensions are sampled from white noise:
    xzData = rand(nPoints,2);
    % y dimension is sampled from gaussian noise, in order to add some
    % changes through time:
    yData = randn(nPoints,1);

    % scale the data according to our axes limits that were set above:
    xzData = xzData .* diff(axLimits([1 3],:),[],2)' + axLimits([1 3],1)';
    yData = (yData/3 + 1) .* diff(axLimits(2,:)) + axLimits(2,1);

    % actually plot the random data, in white with some transparency:
    scatter3(xzData(:,1),yData,xzData(:,2),30,[0.5 0.5 0.5],'o',...
        'MarkerFaceColor',[0.5 0.5 0.5],...
        'MarkerFaceAlpha',0.3,...
        'MarkerEdgeColor','none');
end

% set the data aspect ratio so that the flying scale is visually correct:
daspect(ax, [2*pi 50 650])

% expand the y-axis limit so that we can see beyond the section we're
% flying through:
axLimits(2,2) = axLimits(2,2) * 10;
% and actually apply the requested axis limits:
xlim(ax, axLimits(1,:))
ylim(ax, axLimits(2,:))
zlim(ax, axLimits(3,:))

% set the camera view angle to 50 degrees, for a first-person style view:
camva(ax, 50)
% and change the camera projection style to perspective rather than
% isometric:
camproj(ax, 'perspective')

% crate a "headlight" that the camera projects forward:
hlight = camlight(ax,'headlight');
% and set the lighting to Gouraud to simulate lighting on 3D objects:
lighting(ax,'gouraud')

% add some axes ticks so we get a sense of movement, increasing the number
% of ticks based on the length of the "corridor" we're flying through:
ax.XTick = linspace(axLimits(1,1), axLimits(1,2), 9);
ax.YTick = linspace(axLimits(2,1), axLimits(2,2), 250);
ax.ZTick = linspace(axLimits(3,1), axLimits(3,2), 6);
% remove the labels, and set their colors to a faint gray:
for axis = 'XYZ'
    ax.([axis 'TickLabel']) = [];
    ax.([axis 'Color']) = [0.3 0.3 0.3];
end

% turn the above grid on and set it to a paler gray:
grid(ax,'on')
ax.GridColor = [0.6 0.6 0.6];
% make the background and axes colors transparent:
% (unlike above, need to use a cell array to include a blank character)
noCols = {'','X','Y','Z'};
for n = 1:length(noCols)
    ax.([noCols{n} 'Color']) = 'none';
end
% and set the figure color to a nice dark shade (and don't invert any
% printed version when exporting to a video or GIF):
set(hfig, 'color', [0.15 0.15 0.15], 'InvertHardCopy', 'off')

%% Set up a vector that will determine where the camera is through time:
% set how far the camera moves ahead each frame:
tBinSlide = 0.5;
% and create the time vector that advances that amount on the y-axis (and
% undo the view extension from line 41):
timeVector = axLimits(2,1):tBinSlide:axLimits(2,2)/10;
% determine how the x- and z-positions will be set based on our position in
% time (and thus also our position on the y-axis). Here, we're just using
% sine waves for each for a nice "swoop":
dx = sin(timeVector/24) * 2;
dz = sin(timeVector/24) * 50;


%% Run the animation:
% set how far ahead in the path the target should be looking:
targetLead = 40;
% set how far back the camera is lagging at the start from the targetted
% position:
lag = -100;

% finally, loop through the time vector, up until we're targetting the end
% of the vector: (note that grid lines might "wobble" when viewing this
% live in matlab, but this will not occur in any exported video or GIF)
for j = 1:length(timeVector)-targetLead
    % update the camera position according to the above calculated paths:
    campos(ax,[dx(j) lag+j dz(j)])
    % update where the camera is targeting based on the requested amount
    % ahead on the paths:
    camtarget(ax,[dx(j+targetLead) (j+targetLead) dz(j+targetLead)])
    % roll the camera based on the x-value, in order to tilt into
    % horizontal turns: (note that camroll inputs are relative to the
    % current state rather than an absolute value)
    camroll(ax,-dx(j+targetLead)/10);
    % ensure the changes are actually drawn to screen:
    drawnow();
    % and pause for the correct amount of time to produce the requested
    % frame rate. if exporting to video or GIF, that would be done instead
    % of this pause:
    pause(1/frameRate)
end
