$(function () {

	'use strict';
	require.config({
		baseUrl: 'https://microsoft.github.io/monaco-editor/node_modules/monaco-editor/min/'
	});


	var editor = null, diffEditor = null;

	$(document).ready(function () {

		require(['vs/editor/editor.main'], function () {
			var MODES = (function () {
				var modesIds = monaco.languages.getLanguages().map(function (lang) {
					console.log(lang)
					return lang.id;
				});

				modesIds.sort();

				return modesIds.map(function (modeId) {
					return {
						modeId: modeId,
						sampleURL: 'https://microsoft.github.io/monaco-editor/index/samples/sample.' + modeId + '.txt'
					};
				});
			})();

		    //Loading Solidity based editor
			loadSample(MODES[75]);

			
			

			//Loading file comparision file lhs and rhs
			//loadDiffSample();

			//diffEditor.updateOptions({
			//	renderSideBySide: false,
			//});
		});

		window.onresize = function () {
			if (editor) {
				editor.layout();
			}
			if (diffEditor) {
				diffEditor.layout();
			}
		};
	});

	function loadSample(mode) {
		$.ajax({
			type: 'GET',
			url: mode.sampleURL,
			dataType: 'text',
			beforeSend: function () {
				$('.loading.editor').show();


				
				editor = monaco.editor.create(document.getElementById('editor'), {
					glyphMargin: true,
				   //contextmenu: false
				});

				//Add Custom Lable/Actions

				editor.addAction({
					// An unique identifier of the contributed action.
					id: 'my-unique-id',

					// A label of the action that will be presented to the user.
					label: 'Capture Line Number',

					// An optional array of keybindings for the action.
					keybindings: [
						monaco.KeyMod.CtrlCmd | monaco.KeyCode.F10,
						// chord
						monaco.KeyMod.chord(
							monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK,
							monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyM
						)
					],

					// A precondition for this action.
					precondition: null,

					// A rule to evaluate on top of the precondition in order to dispatch the keybindings.
					keybindingContext: null,

					contextMenuGroupId: 'navigation',

					contextMenuOrder: 1.5,

					// Method that will be executed when the action is triggered.
					// @param editor The editor instance is passed in as a convenience
					run: function (ed) {
						alert("i'm running => " + ed.getPosition());
					}
				});



				// Mouse events
				editor.onMouseMove(function (e) {
					console.log('mousemove - ' + e.target.toString());
					console.log(e.target);
				});
				editor.onMouseDown(function (e) {
					console.log('mousedown - ' + e.target.toString());
					console.log(e.target);
				});
				editor.onContextMenu(function (e) {
					console.log('contextmenu - ' + e.target.toString());
					console.log(e.target);
				});
				editor.onMouseLeave(function (e) {
					console.log('mouseleave');
					console.log(e.target);
				});



				// add key event
				editor.addCommand(monaco.KeyCode.F9, function () {
					alert('F9 pressed!');
				});
			},
			error: function () {
				if (editor) {
					if (editor.getModel()) {
						editor.getModel().dispose();
					}
					editor.dispose();
					editor = null;
				}
				$('.loading.editor').fadeOut({ duration: 200 });
				$('#editor').empty();
				$('#editor').append('<p class="alert alert-error">Failed to load ' + mode.modeId + ' sample</p>');
			}
		}).done(function (data) {
			if (!editor) {
				$('#editor').empty();
				editor = monaco.editor.create(document.getElementById('editor'), {
					model: null,
				});
			}

			var oldModel = editor.getModel();
			var newModel = monaco.editor.createModel(data, mode.modeId);
			editor.setModel(newModel);
			if (oldModel) {
				oldModel.dispose();
			}
			$('.loading.editor').fadeOut({ duration: 300 });
		});
	}

	function loadDiffSample() {

		var onError = function () {
			$('.loading.diff-editor').fadeOut({ duration: 200 });
			$('#diff-editor').append('<p class="alert alert-error">Failed to load diff editor sample</p>');
		};

		$('.loading.diff-editor').show();

		var lhsData = null, rhsData = null, jsMode = null;

		$.ajax({
			type: 'GET',
			url: 'https://microsoft.github.io/monaco-editor/index/samples/diff.lhs.txt',
			dataType: 'text',
			error: onError
		}).done(function (data) {
		
			lhsData = data;
			onProgress();
		});

		$.ajax({
			type: 'GET',
			url: 'https://microsoft.github.io/monaco-editor/index/samples/diff.rhs.txt',
			dataType: 'text',
			error: onError
		}).done(function (data) {
			rhsData = data;
			onProgress();
		});

		function onProgress() {
			if (lhsData && rhsData) {
				diffEditor = monaco.editor.createDiffEditor(document.getElementById('diff-editor'), {
					enableSplitViewResizing: true
				});

				var lhsModel = monaco.editor.createModel(lhsData, 'text/javascript');
				var rhsModel = monaco.editor.createModel(rhsData, 'text/javascript');

				diffEditor.setModel({
					original: lhsModel,
					modified: rhsModel
				});

				$('.loading.diff-editor').fadeOut({ duration: 300 });
			}
		}
	}
})
