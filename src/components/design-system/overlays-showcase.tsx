"use client";

import * as React from "react";
import { Copy, Pencil, Plus, Target, Trash2, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetClose, SheetContent, SheetTrigger, DrawerContent } from "@/components/ui/sheet";
import { Modal, ModalClose, ModalContent, ModalTrigger } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { CommandMenu } from "@/components/ui/command-menu";
import { useToast } from "@/components/ui/toast";
import { ShowcaseSection, Example } from "@/components/design-system/showcase-ui";
import { ShowcaseNav } from "@/components/design-system/showcase-nav";

export function OverlaysShowcase() {
  const { toast } = useToast();
  const [cmdOpen, setCmdOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Overlays" description="Popover, sheets, diálogos e paleta de comandos." />
      <ShowcaseNav />

      <ShowcaseSection title="Popover & Tooltip">
        <div className="flex flex-wrap items-center gap-4">
          <Example label="Popover">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="secondary" size="sm">
                  Abrir popover
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <p className="text-body2 font-semibold text-ink">Filtro rápido</p>
                <p className="mt-1 text-small text-ink-2">
                  Conteúdo livre dentro do popover, com foco preso e fechamento por Escape.
                </p>
              </PopoverContent>
            </Popover>
          </Example>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Sheet & Drawer">
        <div className="flex flex-wrap items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" size="sm">
                Sheet (direita)
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              title="Detalhes do contato"
              description="Painel lateral deslizante."
              footer={
                <SheetClose asChild>
                  <Button size="sm">Fechar</Button>
                </SheetClose>
              }
            >
              <p>Use sheets para edições rápidas sem sair da listagem.</p>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" size="sm">
                Drawer (base)
              </Button>
            </SheetTrigger>
            <DrawerContent title="Ações" description="Drawer ancorado na base (mobile).">
              <p>Ideal para ações no mobile.</p>
            </DrawerContent>
          </Sheet>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Diálogos">
        <div className="flex flex-wrap items-center gap-3">
          <Modal>
            <ModalTrigger asChild>
              <Button variant="secondary" size="sm">
                Modal
              </Button>
            </ModalTrigger>
            <ModalContent
              title="Editar oportunidade"
              description="Janela modal com foco preso."
              footer={
                <>
                  <ModalClose asChild>
                    <Button size="sm" variant="secondary">
                      Cancelar
                    </Button>
                  </ModalClose>
                  <ModalClose asChild>
                    <Button size="sm">Salvar</Button>
                  </ModalClose>
                </>
              }
            >
              Conteúdo do modal.
            </ModalContent>
          </Modal>

          <ConfirmDialog
            trigger={
              <Button variant="danger" size="sm">
                <Trash2 />
                Excluir (confirm)
              </Button>
            }
            title="Excluir oportunidade?"
            description="Esta ação não pode ser desfeita."
            confirmLabel="Excluir"
            destructive
            onConfirm={() => toast({ title: "Excluído (mock)", variant: "success" })}
          />
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Context menu">
        <ContextMenu>
          <ContextMenuTrigger className="flex h-24 items-center justify-center rounded-lg border border-dashed border-line bg-surface text-body2 text-ink-2">
            Clique com o botão direito aqui
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuLabel>Ações</ContextMenuLabel>
            <ContextMenuItem>
              <Pencil aria-hidden />
              Editar
            </ContextMenuItem>
            <ContextMenuItem>
              <Copy aria-hidden />
              Duplicar
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem destructive>
              <Trash2 aria-hidden />
              Excluir
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </ShowcaseSection>

      <ShowcaseSection title="Command menu (Ctrl/⌘ + K)">
        <Button variant="secondary" size="sm" onClick={() => setCmdOpen(true)}>
          Abrir paleta de comandos
        </Button>
        <CommandMenu
          open={cmdOpen}
          onOpenChange={setCmdOpen}
          enableShortcut
          groups={[
            {
              heading: "Criar",
              items: [
                { label: "Novo contato", icon: Users, shortcut: "C", onSelect: () => toast({ title: "Novo contato" }) },
                { label: "Nova oportunidade", icon: Target, shortcut: "O", onSelect: () => toast({ title: "Nova oportunidade" }) },
              ],
            },
            {
              heading: "Ações",
              items: [{ label: "Adicionar tarefa", icon: Plus, onSelect: () => toast({ title: "Tarefa" }) }],
            },
          ]}
        />
      </ShowcaseSection>
    </div>
  );
}
