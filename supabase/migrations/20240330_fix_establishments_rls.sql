-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Anyone can view establishments" ON establishments;
DROP POLICY IF EXISTS "Authenticated users can create establishments" ON establishments;
DROP POLICY IF EXISTS "Only creator can update establishments" ON establishments;

-- 新しいポリシーを作成
CREATE POLICY "Enable read access for all users" 
ON establishments FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for authenticated users" 
ON establishments FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for establishment creators" 
ON establishments FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Enable delete for establishment creators" 
ON establishments FOR DELETE 
USING (auth.uid() = created_by);