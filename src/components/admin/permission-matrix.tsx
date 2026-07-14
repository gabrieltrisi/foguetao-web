"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { permissionMatrix, permissionActions } from "@/mocks/admin/permissions";
import type { PermissionModule, PermissionAction } from "@/types/admin";

/** Matriz de permissões (módulo × ação) com switches, estilo Notion. */
export function PermissionMatrix({ readOnly = false }: { readOnly?: boolean }) {
  const [matrix, setMatrix] = React.useState<PermissionModule[]>(permissionMatrix);

  const toggle = (moduleKey: string, action: PermissionAction) =>
    setMatrix((prev) =>
      prev.map((m) =>
        m.key === moduleKey ? { ...m, actions: { ...m.actions, [action]: !m.actions[action] } } : m,
      ),
    );

  return (
    <Card className="p-0">
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-white">Módulo</TableHead>
              {permissionActions.map((a) => (
                <TableHead key={a.key} className="text-center">{a.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {matrix.map((m) => (
              <TableRow key={m.key}>
                <TableCell className="sticky left-0 bg-white font-medium text-ink">{m.label}</TableCell>
                {permissionActions.map((a) => (
                  <TableCell key={a.key} className="text-center">
                    <div className="flex justify-center">
                      <Switch
                        checked={m.actions[a.key]}
                        onCheckedChange={readOnly ? undefined : () => toggle(m.key, a.key)}
                        disabled={readOnly}
                        aria-label={`${a.label} · ${m.label}`}
                      />
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
