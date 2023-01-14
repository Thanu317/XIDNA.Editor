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
			loadDiffSample();

			diffEditor.updateOptions({
				renderSideBySide: false
			});
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
