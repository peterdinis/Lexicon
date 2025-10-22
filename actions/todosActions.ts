"use server";

import { getErrorMessage } from "@/constants/applicationConstants";
import { actionClient } from "@/lib/safe-action";
import { createTodoHandler, getTodoHandler, getAllTodosHandler, updateTodoHandler, deleteTodoHandler } from "./handlers/todosHandler";
import { createTodoSchema, todoIdSchema, updateTodoSchema } from "./schemas/todosSchemas";
import { getSupabaseServerClient } from "@/supabase/server";

// CREATE
export const createTodoAction = actionClient
    .inputSchema(createTodoSchema)
    .action(async ({ parsedInput, ctx }) => {
        const supabase = await getSupabaseServerClient();
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            const userId = user!.id;
            return await createTodoHandler(userId, parsedInput);
        } catch (err) {
            throw new Error(getErrorMessage(err));
        }
    });

// GET SINGLE
export const getTodoAction = actionClient
    .inputSchema(todoIdSchema)
    .action(async ({ parsedInput: { id } }) => {
        try {
            return await getTodoHandler(id);
        } catch (err) {
            throw new Error(getErrorMessage(err));
        }
    });

// GET ALL
export const getAllTodosAction = actionClient.action(async ({ ctx }) => {
    try {
        const supabase = await getSupabaseServerClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        const userId = user!.id;
        return await getAllTodosHandler(userId);
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
});

// UPDATE
export const updateTodoAction = actionClient
    .inputSchema(updateTodoSchema)
    .action(async ({ parsedInput }) => {
        try {
            const { id, ...updates } = parsedInput;
            return await updateTodoHandler(id, updates);
        } catch (err) {
            throw new Error(getErrorMessage(err));
        }
    });

// DELETE
export const deleteTodoAction = actionClient
    .inputSchema(todoIdSchema)
    .action(async ({ parsedInput: { id } }) => {
        try {
            return await deleteTodoHandler(id);
        } catch (err) {
            throw new Error(getErrorMessage(err));
        }
    });