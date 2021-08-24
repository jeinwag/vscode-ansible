/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved..
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { commands, Extension, extensions, window } from 'vscode';

// A set of VSCode extension ID's that conflict with our extension
const conflictingIDs = new Set([
    'haaaad.ansible',
    'sysninja.vscode-ansible-mod',
    'tomaciazek.ansible',
    'vscoss.vscode-ansible',
    'zbr.vscode-ansible',
]);

// A set of VSCode extension ID's that are currently uninstalling
const uninstallingIDs = new Set();

/**
 * Get all of the installed extensions that currently conflict with VSCode-YAML
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getConflictingExtensions(): Extension<any>[] {
  const conflictingExtensions: Extension<any>[] = [];
  conflictingIDs.forEach((extension) => {
    const ext = extensions.getExtension(extension);
    if (ext && !uninstallingIDs.has(ext.id)) {
      conflictingExtensions.push(ext);
    }
  });
  return conflictingExtensions;
}

/**
 * Display the uninstall conflicting extension notification if there are any conflicting extensions currently installed
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function showUninstallConflictsNotification(conflictingExts: Extension<any>[]): void {
  // Add all available conflicting extensions to the uninstalling IDs map
  for (const extIndex in conflictingExts) {
    const ext = conflictingExts[extIndex];
    uninstallingIDs.add(ext.id);
  }

  const uninstallMsg = 'Uninstall';

  // Gather all the conflicting display names
  let conflictMsg = '';
  if (conflictingExts.length === 1) {
    conflictMsg = `${conflictingExts[0].packageJSON.displayName} extension is incompatible with redhat.ansible. Please uninstall it.`;
  } else {
    const extNames: string[] = [];
    conflictingExts.forEach((ext) => {
      extNames.push(ext.packageJSON.displayName);
    });
    conflictMsg = `The ${extNames.join(', ')} extensions are incompatible with redhat.ansible. Please uninstall them.`;
  }

  if (conflictingExts.length > 0) {
    window.showInformationMessage(conflictMsg, uninstallMsg).then((clickedMsg) => {
      if (clickedMsg === uninstallMsg) {
        conflictingExts.forEach((ext) => {
          commands.executeCommand('workbench.extensions.uninstallExtension', ext.id);
          uninstallingIDs.delete(ext.id);
        });
      }
    });
  }
}
